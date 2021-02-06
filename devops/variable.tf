variable "project" {
  type    = string
  default = "access-it-303602"
}

variable "name" {
  type    = string
  default = "access-it"
}

variable "backend_hostname" {
  type    =  string
  default = "backend.access-it.me"
}

variable "frontend_hostname" {
  type    =  string
  default = "access-it.me"
}

variable "image_name" {
  type    = string
  default = "access-it"
}