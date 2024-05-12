# Google Cloud Function

Função servless para verificar a existência de um usuário no Cloud Identity. Se existir, retorna o registro encontrado. Caso contrário cria um novo registro.

## Deploy no GCP
Para realizar  o deploy no ambiente do GCP execute o comando abaixo no gcloud CLI

~~~bash
gcloud functions deploy auth-user \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=authUser \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars APP_ENDPOINT=<APP_BASEURL>

  ~~~bash