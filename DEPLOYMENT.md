# Deployment Guide

Руководство по развертыванию PDS Consultant Bot в production.

## 📋 Содержание

- [Docker Deployment](#docker-deployment)
- [Yandex Cloud](#yandex-cloud)
- [Railway](#railway)
- [VPS/Dedicated Server](#vpsdedicated-server)
- [Environment Variables](#environment-variables)
- [CI/CD Setup](#cicd-setup)

## 🐳 Docker Deployment

### Локальная сборка и запуск

```bash
# 1. Создать .env файл
cp .env.example .env
# Заполните переменные окружения

# 2. Сборка образа
docker build -t pds-consultant .

# 3. Запуск контейнера
docker run -d \
  --name pds-bot \
  --env-file .env \
  -p 8080:8080 \
  pds-consultant

# 4. Проверка логов
docker logs -f pds-bot

# 5. Health check
curl http://localhost:8080/health
```

### Управление контейнером

```bash
# Остановка
docker stop pds-bot

# Запуск
docker start pds-bot

# Удаление контейнера
docker rm -f pds-bot
```

Если требуется постоянное хранилище для PDF, смонтируйте volume:

```bash
docker run -d \
  --name pds-bot \
  --env-file .env \
  -p 8080:8080 \
  -v pds-reports:/tmp/pds-consultant-reports \
  pds-consultant
```

## ☁️ Yandex Cloud

### Container Registry

```bash
# 1. Аутентификация
yc init

# 2. Создание registry
yc container registry create --name pds-bot-registry

# 3. Получение ID registry
export REGISTRY_ID=$(yc container registry get --name pds-bot-registry --format json | jq -r .id)

# 4. Docker login
yc container registry configure-docker

# 5. Тег образа
docker tag pds-consultant cr.yandex/$REGISTRY_ID/pds-consultant:latest

# 6. Push
docker push cr.yandex/$REGISTRY_ID/pds-consultant:latest
```

### Serverless Containers

```bash
# 1. Создание контейнера
yc serverless container create --name pds-bot

# 2. Деплой ревизии
yc serverless container revision deploy \
  --container-name pds-bot \
  --image cr.yandex/$REGISTRY_ID/pds-consultant:latest \
  --cores 1 \
  --memory 512MB \
  --execution-timeout 30s \
  --service-account-id $SERVICE_ACCOUNT_ID \
  --environment TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN \
  --environment WEBHOOK_SECRET=$WEBHOOK_SECRET \
  --environment PUBLIC_BASE_URL=$PUBLIC_BASE_URL

# 3. Получить URL
yc serverless container get --name pds-bot --format json | jq -r .url
```

### Установка webhook

```bash
# Используя полученный URL
npm run webhook:set https://your-container-url.containers.yandexcloud.net/tg/YOUR_WEBHOOK_SECRET
```

## 🚂 Railway

### Через Web UI

1. Зайдите на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Выберите репозиторий
4. Railway автоматически обнаружит Dockerfile
5. Добавьте Environment Variables:
   ```
   TELEGRAM_BOT_TOKEN=your_token
   WEBHOOK_SECRET=your_secret
   PUBLIC_BASE_URL=https://your-app.up.railway.app
   ```

### Через CLI

```bash
# Установка CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация
railway init

# Деплой
railway up

# Переменные окружения
railway variables set TELEGRAM_BOT_TOKEN=your_token
railway variables set WEBHOOK_SECRET=your_secret
railway variables set PUBLIC_BASE_URL=https://your-app.up.railway.app

# Логи
railway logs
```

## 🖥️ VPS/Dedicated Server

### Подготовка сервера

```bash
# 1. Обновление системы
sudo apt update && sudo apt upgrade -y

# 2. Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Установка Docker Compose
sudo apt install docker-compose -y

# 4. Создание пользователя для приложения
sudo useradd -m -s /bin/bash botuser
sudo usermod -aG docker botuser
```

### Деплой

```bash
# 1. Клонирование репозитория
cd /home/botuser
git clone https://github.com/your-username/pds-consultant.git
cd pds-consultant

# 2. Настройка .env
cp .env.example .env
nano .env  # Заполните переменные

# 3. Сборка и запуск
docker-compose up -d --build

# 4. Настройка автозапуска (systemd)
sudo nano /etc/systemd/system/pds-bot.service
```

#### systemd service file

```ini
[Unit]
Description=PDS Consultant Bot
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/botuser/pds-consultant
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=botuser

[Install]
WantedBy=multi-user.target
```

```bash
# Активация сервиса
sudo systemctl daemon-reload
sudo systemctl enable pds-bot
sudo systemctl start pds-bot

# Проверка статуса
sudo systemctl status pds-bot
```

### Nginx Reverse Proxy (опционально)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Установка Certbot для SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 🔐 Environment Variables

| Переменная           | Обязательна | Описание                                     | Пример                    |
| -------------------- | ----------- | -------------------------------------------- | ------------------------- |
| `TELEGRAM_BOT_TOKEN` | ✅          | Токен бота от @BotFather                     | `123456:ABC-DEF...`       |
| `WEBHOOK_SECRET`     | ✅          | Секретный ключ для webhook (мин. 8 символов) | `my-secret-key-123`       |
| `PUBLIC_BASE_URL`    | ⚠️          | Публичный URL для webhook                    | `https://bot.example.com` |
| `DEV_PORT`           | ❌          | Порт сервера (по умолчанию 8080)             | `8080`                    |
| `LOG_LEVEL`          | ❌          | Уровень логирования                          | `info`                    |
| `NODE_ENV`           | ❌          | Окружение Node.js                            | `production`              |

⚠️ `PUBLIC_BASE_URL` требуется для автоматической установки webhook

## 🔄 CI/CD Setup

### GitHub Actions

#### 1. Секреты GitHub

Добавьте в Settings → Secrets and variables → Actions:

```
TELEGRAM_BOT_TOKEN=your_bot_token
WEBHOOK_SECRET=your_webhook_secret

# Для Yandex Cloud (опционально)
YC_SA_JSON={"id":"...","service_account_id":"..."}
YC_REGISTRY_ID=crp...

# Для Railway (опционально)
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE=your_service_id

# Для SSH деплоя (опционально)
DEPLOY_HOST=your.server.com
DEPLOY_USER=botuser
DEPLOY_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----...

# Для уведомлений (опционально)
TELEGRAM_CHAT_ID=your_chat_id
```

#### 2. Переменные GitHub

Settings → Secrets and variables → Variables:

```
DEPLOY_PLATFORM=yandex-cloud  # или railway, или ssh
ENABLE_TELEGRAM_NOTIFICATIONS=true
```

#### 3. Ручной запуск workflow

```bash
# Через GitHub CLI
gh workflow run ci-cd.yml

# Через Web UI
Actions → CI/CD Pipeline → Run workflow
```

### GitLab CI

Создайте `.gitlab-ci.yml`:

```yaml
stages:
  - lint
  - build
  - docker
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: '/certs'

lint:
  stage: lint
  image: node:20-slim
  script:
    - npm ci
    - npm run lint
    - npm run typecheck

build:
  stage: build
  image: node:20-slim
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

docker:
  stage: docker
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  only:
    - main

deploy:
  stage: deploy
  script:
    - echo "Deploy to production"
  only:
    - main
```

## 📊 Мониторинг

### Health Check

```bash
# Простая проверка
curl http://localhost:8080/health

# С jq
curl -s http://localhost:8080/health | jq

# В скрипте
#!/bin/bash
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Bot is healthy"
else
    echo "Bot is down!"
    # Перезапуск
    docker-compose restart
fi
```

### Логи

```bash
# Docker logs
docker logs -f pds-bot --tail=100

# Docker Compose logs
docker-compose logs -f --tail=100

# Фильтр по уровню (с jq)
docker logs pds-bot 2>&1 | grep '"level":50' | jq

# Systemd logs
sudo journalctl -u pds-bot -f
```

### Webhook Info

```bash
# Проверка webhook
npm run webhook:info

# Через API напрямую
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq
```

## 🔧 Troubleshooting

### Бот не отвечает

1. Проверьте логи:

   ```bash
   docker logs pds-bot --tail=50
   ```

2. Проверьте webhook:

   ```bash
   npm run webhook:info
   ```

3. Если webhook неправильный:
   ```bash
   npm run webhook:delete
   npm run webhook:set https://your-correct-url/tg/your-secret
   ```

### Ошибки Playwright

```bash
# Пересборка с --no-cache
docker build --no-cache -t pds-consultant .

# Проверка установки браузеров в контейнере
docker run -it pds-consultant npx playwright --version
```

### Memory Issues

Увеличьте лимиты в `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

## 🚀 Production Checklist

- [ ] Установлены все environment variables
- [ ] `NODE_ENV=production`
- [ ] Webhook настроен правильно
- [ ] Health check работает
- [ ] Логирование настроено
- [ ] Мониторинг настроен
- [ ] Backup strategy определена
- [ ] CI/CD pipeline протестирован
- [ ] SSL сертификат установлен (если нужен)
- [ ] Rate limiting настроен (если нужен)
- [ ] Firewall правила настроены
- [ ] Документация обновлена

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Yandex Cloud Container Registry](https://cloud.yandex.ru/docs/container-registry/)
- [Railway Documentation](https://docs.railway.app/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [grammY Documentation](https://grammy.dev/)
