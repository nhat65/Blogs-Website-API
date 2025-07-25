import fs from 'fs';
import path from 'path';

export const deleteImage = (imageUrl: string | null, accountId: number | undefined): void => {
  if (
    imageUrl &&
    fs.existsSync(path.join(__dirname, `../uploads/account_${accountId}`, path.basename(imageUrl)))
  ) {
    try {
      fs.unlinkSync(
        path.join(__dirname, `../uploads/account_${accountId}`, path.basename(imageUrl)),
      );
    } catch (err) {}
  }
};
