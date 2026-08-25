# Android App Links

Publique `deployment/.well-known/assetlinks.json` em `https://meuzovo.app.br/.well-known/assetlinks.json`.
O endpoint precisa responder HTTPS, sem redirecionamento, com `Content-Type: application/json`.

O arquivo incluído usa o SHA-256 da chave de debug atual, portanto permite testar App Links com o APK debug gerado nesta máquina. Antes de publicar, substitua o fingerprint pelo certificado de release ou pelo certificado de assinatura do Google Play.

Configure a rota `https://meuzovo.app.br/invite/*` no servidor para redirecionar para:

`https://play.google.com/store/apps/details?id=com.meuzovo.donaluiza`

Com o app instalado e o `assetlinks.json` publicado, o Android abre o aplicativo. Sem o app, o navegador recebe a rota e é redirecionado para a Play Store.

`deployment/invite/index.html` é a página de fallback. Configure a hospedagem para servir esse arquivo para qualquer rota `/invite/*`; por exemplo, com Nginx:

```nginx
location /invite/ {
  try_files /invite/index.html =404;
}
```

As regras alteradas em `firestore.rules` precisam ser publicadas no Console do Firebase ou com Firebase CLI antes de testar o compartilhamento remoto.
