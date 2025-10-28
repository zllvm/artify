terraform {
  required_version = ">= 1.13.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0"
    }
  }
}

resource "aws_kms_key" "this" {
  description             = "KMS key for ${local.secret_name} secrets"
  deletion_window_in_days = 10
  enable_key_rotation     = true
  policy                  = var.kms_policy_json
}

resource "aws_kms_alias" "this" {
  name          = "alias/${local.secret_name}"
  target_key_id = aws_kms_key.this.key_id
}

resource "aws_secretsmanager_secret" "config" {
  name      = local.secret_name
  kms_key_id = aws_kms_key.this.arn
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "config" {
  secret_id     = aws_secretsmanager_secret.config.id
  secret_string = local.secret_json
}

data "aws_iam_policy_document" "read_config" {
  statement {
    sid      = "ReadConfigSecret"
    effect   = "Allow"
    actions  = ["secretsmanager:GetSecretValue","secretsmanager:DescribeSecret"]
    resources = [aws_secretsmanager_secret.config.arn]
  }
  statement {
    sid      = "UseKms"
    effect   = "Allow"
    actions  = ["kms:Decrypt","kms:DescribeKey"]
    resources = [aws_kms_key.this.arn]
  }
}

resource "aws_iam_policy" "read_config" {
  name   = "${local.secret_name}-read-config"
  policy = data.aws_iam_policy_document.read_config.json
}

output "secret_arn"    { value = aws_secretsmanager_secret.config.arn }
output "kms_key_arn"   { value = aws_kms_key.this.arn }
output "read_policy_arn" { value = aws_iam_policy.read_config.arn }