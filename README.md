# 調整さん自動化
参加してるフットサルサークルのLINEグループでの調整さん回答自動化を目指す

## 要件
- LINEグループのメッセージに調整さんURLが回ってきたら、自動で参加回答する
- 既に回答がある場合は回答しない

## 設計
- LINEグループ監視
    - 公式アカウント(bot)をいれて、メッセージを監視。webhook送信。
        - webhookにはそのテキストメッセージが含まれる
- アプリケーション(on Render)
    - Render上に回答用nodeアプリケーションを立てる
    - botからwebhookをうけ、調整さんドメインのURLが含まれているか確認
        - 含まれていない場合、処理終了
        - 含まれている場合、回答者（Render側の環境変数で設定）が既に回答しているか確認する
            - 回答している場合、処理終了
            - 未回答の場合、回答を行う。
    - 自動回答の方法について
        - httpリクエストでの回答にもチャレンジしたが、内部で動的に用意されたtokenが必要でできなかった。
            - その旨調整さん運営にも質問したが、API提供してないとのことでこの方法は断念。
        - ヘッドレスブラウザ(puppeteer)でアクセス・操作している
            - 詳細はchousei.js参照

## todo
- [done] メッセージ監視からwebhook投げる方法
    - https://odyprograming.com/line_messaging_api_get/#toc9
    - https://blog.socialplus.jp/knowledge/line-webhook/
- [done] GASのスクリプトで調整さんURLから回答する方法の調査
    - gasではむりそう。httpリクエストでしかできなそう。サーバ立ててヘッドレスブラウザ操作する方法しかなさそう
- [done] ローカルでヘッドレスブラウザ使って調整さんに回答する
- [done] Renderにデプロイして動作確認
- [done] 回答済みの場合は回答しないように修正
- [done] webhook起因で動くようにする
    - [done] js修正
    - [done] botアカウントを準備
    - [done] テスト 
- [done] botのグループ招待の許可を得る
- [done] readme修正
- [pending] 複数人回答対応
    - PARTICIPANTを配列に。
    - 「既存の回答を探す」以降の処理をPARTICIPANT.countの数だけ回す
- [done] 名前を環境変数で設定する

## メモ
- renderのdashboard
    - https://dashboard.render.com/
    - 無料分確認: https://dashboard.render.com/billing#free-usage
- lineプラットフォーム
    - https://manager.line.biz/
    - https://developers.line.biz/ja/
- 検証用調整さん
    - https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a

- アプリ直リクエストcurl
```
curl -X POST \
-H "Content-Type: application/json" \
-d '{"events":[{"message": {"text": "調整さんURLないパターン"}}]}' \
https://{renderのドメイン}/webhook

curl -X POST \
-H "Content-Type: application/json" \
-d '{"events":[{"message": {"text": "調整さんURLあるパターン https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a"}}]}' \
https://{renderのドメイン}/webhook
```

<details>
<summary>httpリクエストを試みた時の雑記</summary>

https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a&n=hoge&c=◯

h=XXXXX : 調整さんのイベントURLの最後にあるID
n=名前 : 回答者の名前
c=参加予定 : 「◯」「△」「×」をカンマ区切りで入力します。
<input type="submit" name="add" id="memUpdBtn" value="入力する" style="font-size: 120%;">
\"name\":\"hoge\",\"attend\":\"1,2,3,1\"
1: ◯
2: △
3: ×
\"members\":[
    {\"id\":211435367,\"num\":1,\"name\":\"hoge\",\"attend\":\"1,2,3,1\",\"comment\":null,\"kouho\":[1,2,3,1]},
    {\"id\":211436753,\"num\":2,\"name\":\"hoge2\",\"attend\":\"1,2,3,1\",\"comment\":\"comment\",\"kouho\":[1,2,3,1]},
    {\"id\":211438161,\"num\":3,\"name\":\"ryuji\",\"attend\":\"3,3,3,3\",\"comment\":null,\"kouho\":[3,3,3,3]}
    ]
</details>
