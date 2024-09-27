export class FileFetchDto {
  source?: string;
  image_name?: string;
  nested_key?: string;
  extensions?: string;
  no_img_req?: boolean;
  no_img_val?: string;
  width?: number;
  height?: number;
  path?: string;
  color?: string;
  fit?: string;
}

export class FileUploadDto {
  source?: string;
  upload_path?: string;
  src_file: string;
  dst_file: string;
  extensions?: string;
  file_type?: string;
  file_size?: number;
  max_size?: number;
  async?: boolean;
}
