terraform {
  backend "s3" {
    bucket       = "eventdrivenimageapp-terraform-state-762233741554"
    key          = "eventdriven-imageapp/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}