## Содержимое .env (в корне)
Пример:
```
REACT_APP_BASE_URL=http://localhost:3000/
REACT_APP_BASE_URL_WS=ws://localhost:3000/
```

## Ручной запуск

### Установка nodejs, npm, yarn

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install --lts
npm install --global yarn
```

### Запуск проекта

```
yarn install
yarn start
```

## Запуск посредством docker

При необходимости смены порта в docker-compose.yml указать нужный порт, в файле 
nginx.default.conf также указать порт возле директивы listen.

```
docker-compose up --build -d
```
