# 調整さん自動回答スクリプト
- LINEグループのメッセージに送信される調整さんに自動で回答します。
- 既に回答がある場合は回答しません。

## 設計
- LINEグループ監視
    - 公式アカウント(bot)をいれて、メッセージを監視。メッセージを含んだwebhookをアプリに送信。
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
    - 無料プランでは15分リクエストがないとサーバがスリープする
        - 公式docs: https://render.com/docs/free#spinning-down-on-idle
        - 対策: https://zenn.dev/no215/articles/ff4f1670c080e4
        - トリガは10分おきに作動。jsで土曜11:45-12:15にのみアプリを起こすように設定。
