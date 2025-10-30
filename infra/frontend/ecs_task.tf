data "aws_region" "current" {}

resource "aws_iam_role" "ecs_task_role" {
  name = "${local.env_service_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Sid    = "ecs"
        Principal = {
          Service = ["ecs-tasks.amazonaws.com"]
        }
        Action = ["sts:AssumeRole"]
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "metrics_policy" {
  name        = "${local.env_service_name}-metrics-policy"
  description = "Policy for CloudWatch metrics"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData"]
        Resource = "*"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${local.env_service_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Sid    = "ecs"
        Principal = {
          Service = ["ecs-tasks.amazonaws.com"]
        }
        Action = ["sts:AssumeRole"]
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "metrics_policy_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.metrics_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "main" {
  family                   = "${local.env_service_name}"
  network_mode              = "awsvpc"
  requires_compatibilities  = ["FARGATE"]
  cpu                       = var.cpu
  memory                    = var.memory
  execution_role_arn        = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn             = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = local.service_name
      image     = var.container_image
      essential = true
      portMappings = [{
        containerPort = var.container_port,
      }]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.env == "prod" ? "production" : var.env
        },
        {
          name  = "JWT_PUBLIC_KEY"
          value = var.jwt_public_key
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.service_name
          awslogs-region        = data.aws_region.current.region
          awslogs-stream-prefix = var.env
        }
      }
    }
  ])

  tags = local.tags
}


output "ecs_task_definition_arn" {
  value = aws_ecs_task_definition.main.arn
}