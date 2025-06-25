import multer from 'multer';

// メモリストレージを使用 (ファイルはサーバーのメモリに一時的に保存される)
const storage = multer.memoryStorage();

// ファイルタイプのフィルタリング (任意)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('許可されていないファイルタイプです。JPEG, PNG, GIFのみアップロードできます。'));
        // cb(null, false); // エラーを出さずに拒否する場合
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MBまでのファイルサイズ制限 (任意)
    },
    fileFilter: fileFilter // 任意
});