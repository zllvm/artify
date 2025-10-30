data "aws_cloudformation_export" "vpc" {
  name = "core-vpc"
}

data "aws_cloudformation_export" "ecs_cluster" {
  name = "ecs-common-cluster"
}

data "aws_cloudformation_export" "ecs_subnet" {
  name = "core-vpc-public-subnet-a"
}

data "aws_cloudformation_export" "ecs_sg" {
  name = "core-vpc-sg-basic-fargate"
}

data "aws_cloudformation_export" "elb_sg" {
  name = "ecs-common-lb-sg"
}

data "aws_cloudformation_export" "elb_listener" {
  name = "ecs-common-lb-listener"
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${local.env_service_name}-ecs-tasks-sg"
  description = "Allow inbound traffic to ECS tasks"
  vpc_id      = data.aws_cloudformation_export.vpc.value

  # Inbound: ALB -> ECS container port
  ingress {
    description = "Allow inbound from ALB"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    security_groups = [data.aws_cloudformation_export.elb_sg.value]
  }

  # Outbound: allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

resource "aws_lb_target_group" "app" {
  name        = "${local.service_name}-tg" # max 32 chars
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.aws_cloudformation_export.vpc.value

  health_check {
    path = var.health_endpoint
    port = var.container_port
  }
}

resource "aws_lb_listener_rule" "app" {
  listener_arn = data.aws_cloudformation_export.elb_listener.value
  priority     = 4

  condition {
    host_header {
      values = [local.domain]
    }
  }

  condition {
    path_pattern {
      values = ["/api/*", "/uploads/*"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  depends_on = [aws_lb_target_group.app]
}

resource "aws_ecs_service" "main" {
  name            = local.env_service_name
  cluster         = data.aws_cloudformation_export.ecs_cluster.value
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [data.aws_cloudformation_export.ecs_subnet.value]
    security_groups = [data.aws_cloudformation_export.ecs_sg.value, aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = local.service_name
    container_port   = var.container_port
  }

  depends_on = [ aws_lb_listener_rule.app ]
  
  tags = local.tags
}


output "ecs_service_name" {
  value = aws_ecs_service.main.name
}