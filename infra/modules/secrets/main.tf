terraform {
  required_version = ">= 1.13.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0"
    }
  }
}

# ─────────────────────────────────────────────────────────────
# KMS (optional)
# ─────────────────────────────────────────────────────────────

resource "aws_kms_key" "this" {
  for_each                = var.use_custom_kms ? { main = true } : {}
  description             = "KMS key for ${local.secret_name} secrets"
  deletion_window_in_days = 10
  enable_key_rotation     = true
  policy                  = var.kms_policy_json
}

resource "aws_kms_alias" "this" {
  for_each      = var.use_custom_kms ? { main = true } : {}
  name          = "alias/${local.secret_name}"
  target_key_id = aws_kms_key.this["main"].key_id
}

# ─────────────────────────────────────────────────────────────
# Secrets Manager secret
# ─────────────────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "config" {
  name      = local.secret_name
  kms_key_id = var.use_custom_kms ? aws_kms_key.this["main"].arn : null
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "config" {
  secret_id     = aws_secretsmanager_secret.config.id
  secret_string = local.secret_json
}

# ─────────────────────────────────────────────────────────────
# IAM policy to read the secret (and decrypt if custom key used)
# ─────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "read_config" {
  statement {
    sid      = "ReadConfigSecret"
    effect   = "Allow"
    actions  = ["secretsmanager:GetSecretValue","secretsmanager:DescribeSecret"]
    resources = [aws_secretsmanager_secret.config.arn]
  }
  dynamic "statement" {
    for_each = var.use_custom_kms ? [1] : []
    content {
      sid      = "UseCustomKmsKey"
      effect   = "Allow"
      actions  = ["kms:Decrypt", "kms:DescribeKey"]
      resources = [aws_kms_key.this["main"].arn]
    }
  }
}

resource "aws_iam_policy" "read_config" {
  name   = "${local.secret_name}-read-config"
  policy = data.aws_iam_policy_document.read_config.json
}

resource "aws_secretsmanager_secret_policy" "restrict_access" {
  count      = var.allowed_principal_arn != null ? 1 : 0
  secret_arn = aws_secretsmanager_secret.config.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid: "AllowSpecificPrincipalOnly",
        Effect: "Allow",
        Principal = { AWS = var.allowed_principal_arn },
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        Resource = aws_secretsmanager_secret.config.arn
      }
    ]
  })
}


# ─────────────────────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────────────────────

output "secret_arn"    { value = aws_secretsmanager_secret.config.arn }
output "kms_key_arn" {
  description = "ARN of the KMS key (if custom one used)"
  value       = var.use_custom_kms ? aws_kms_key.this["main"].arn : null
}
output "read_policy_arn" { value = aws_iam_policy.read_config.arn }