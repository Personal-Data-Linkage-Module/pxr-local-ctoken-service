/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * アプリケーションエラー
 * + ハンドリング用に追加
 */
export default class AppError extends Error {
    /** クラス識別名 */
    public static readonly NAME = 'AppError';

    /** ステータスコード（一時的） */
    statusCode: number;

    /**
     * エラーメッセージを設定する
     * @param message エラーメッセージ
     */
    public constructor (message: string, status: number, err?: Error) {
        // 例外内容を元に、継承先のコンストラクターをコール
        super(message);
        // メッセージを設定
        this.message = message;
        // ステータスを設定
        this.statusCode = status;
        // 固定値: 名前を設定
        this.name = 'AppError';

        // 第四引数の確認
        let errorToWrap;
        if (err) {
            errorToWrap = err;
        }

        // スタックトレースの抜き出し
        const stackTraceSoFar = errorToWrap ? errorToWrap.stack : undefined;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
            this.stack = this.mergeStackTrace(this.stack ? this.stack : '', stackTraceSoFar);
            return;
        }

        // スタックトレースをセルフに設定
        // ts-ignore
        const stackTraceEntries = (new Error(message).stack + '').split('\n');
        const stackTraceWithoutConstructors =
          [stackTraceEntries[0], ...stackTraceEntries.slice(3)].join('\n');

        this.stack = this.mergeStackTrace(stackTraceWithoutConstructors, stackTraceSoFar);
    }

    /**
     * エラーを内包する為に、もともと発生したスタックトレースを自身のスタックトレースの下部に移す
     * + ベースが空であれば、マージ対象をそのまま返却
     * + マージの仕方について
     *   + 形式的には、ベース + マージ対象とする
     *   + よって、ベースの下部にマージ対象をくっつけて返却する
     * @param stackTraceToMerge マージ対象スタックトレース
     * @param baseStackTrace ベーススタックトレース
     */
    private mergeStackTrace (stackTraceToMerge: string, baseStackTrace?: string): string {
        // ベースするスタックトレースが存在するか確認する
        if (!baseStackTrace) {
            // マージ対象をそのまま返却
            return stackTraceToMerge;
        }

        // それぞれ改行コードで分割
        const entriesToMerge = stackTraceToMerge.split('\n');
        const baseEntries = baseStackTrace.split('\n');

        // 返却用の配列を定義
        const newEntries: string[] = [];

        // マージ対象の数分、ループ処理
        entriesToMerge.forEach((entry) => {
            // ベースにマージする行が存在すれば、処理終了
            if (baseEntries.includes(entry)) {
                return;
            }

            // ベースの下に、マージ対象の行を追記
            newEntries.push(entry);
        });

        // それぞれを改行コード付きで連結し、文字列として返却する
        return [...newEntries, ...baseEntries].join('\n');
    }
}
