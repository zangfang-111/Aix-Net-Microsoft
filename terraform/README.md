# Terraform

## credentials
rename access_example_tf to access.tf
## generate a new key
```
#private key
openssl genpkey -algorithm RSA -out aix-deployment.pem -pkeyopt rsa_keygen_bits:2048
# public key
openssl rsa -pubout -in aix-deployment.pem -out aix-deployment_pub.pem
```
to access the instance you cuold 
```
ssh -i aix-deployment.pem ubuntu@18.216.238.132
```

## Bitbucket deployments
https://www.nicksantamaria.net/post/self-deploying-site-hugo-terraform-bitbucket-pipelines/