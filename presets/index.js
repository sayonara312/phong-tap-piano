// Danh sách giáo án soạn sẵn. Thêm bài: tạo file presets/<id>.js xuất PRESET rồi thêm vào mảng dưới.
import { PRESET as mrLawrence } from "./mr-lawrence.js";
export const PRESETS = [mrLawrence];
export const findPreset = song => PRESETS.find(p => p.match(song)) || null;
