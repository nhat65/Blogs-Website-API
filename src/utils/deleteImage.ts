import fs from 'fs';
import path from 'path';

export const deleteImage = (imageUrl: string | null): void => {
  if (imageUrl && fs.existsSync(path.join(__dirname, '../uploads', path.basename(imageUrl)))) {
    try {
      fs.unlinkSync(path.join(__dirname, '../uploads', path.basename(imageUrl)));
    } catch (err) {
      
    }
  }
};
