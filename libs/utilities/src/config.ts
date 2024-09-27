import * as path from 'path';

if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const basePath = process.env.PWD;
const rootPath = path.join(process.env.PWD, '/');

const apiURL = 'http://45.79.111.106:3200';
const siteURL = `${process.env.SITE_URL}`;
const adminURL = 'http://45.79.111.106:4200';

const publicFolder = 'public';
const uploadFolder = 'upload';

const publicPath = `${rootPath}${publicFolder}/`;
const publicURL = `${apiURL}/${publicFolder}/`;

export const config = {
  static: {
    separator: '/',
    base_path: basePath,
    root_path: rootPath,

    api_url: apiURL,
    site_url: siteURL,
    admin_url: adminURL,

    public_folder: publicFolder,
    upload_folder: uploadFolder,
    imagic_install_dir: '/usr/bin/',

    upload_path: `${publicPath}${uploadFolder}/`,
    upload_url: `${publicURL}${uploadFolder}/`,

    query_log_path: `${publicPath}logs/queries/`,
    query_log_url: `${publicURL}logs/queries/`,

    request_log_path: `${publicPath}logs/requests/`,
    request_log_url: `${publicURL}logs/requests/`,

    upload_cache_path: `${publicPath}cache/temp/`,
    upload_cache_url: `${publicURL}cache/temp/`,

    upload_temp_path: `${publicPath}${uploadFolder}/temp_files/`,
    upload_temp_url: `${publicURL}${uploadFolder}/temp_files/`,

    upload_profile_path: `${publicPath}${uploadFolder}/profile_image/`,
    upload_profile_url: `${publicURL}${uploadFolder}/profile_image/`,

    debug_log_path: `${publicPath}/logs/debug/`,
    debug_log_url: `${publicURL}/logs/debug`,

    settings_files_path: `${publicPath}${uploadFolder}/settings_files/`,
    settings_files_url: `${publicURL}${uploadFolder}/settings_files/`,

    settings_files_config: {
      upload_folder: 'settings_files',
      aws_vars_list: ['COMPANY_LOGO', 'COMPANY_FAVICON', 'UPLOAD_NOIMAGE'],
    },

    enable_soft_delete: true,
    enable_access_log: true,
    enable_memcached: true,

    enable_query_log: true,
    query_log_truncate: 30,

    upload_max_size: 51200,
    allowed_extensions:
      'jpg,jpeg,jpe,jp2,j2k,jpf,jpg2,jpx,jpm,mj2,mjp2,png,gif,bmp,ico,svg,tiff,tif',

    default_admin_roles: ['admin', 'hbadmin'],
    default_admin_groups: ['admin', 'hbadmin'],

    restrict_admin_users: ['hbadmin'],
    restrict_admin_groups: ['hbadmin'],

    admin_lf_display_limit: 10,
    admin_lf_dropdown_limit: 100,
    admin_dd_pagination_limit: 1000,
    admin_download_files_limit: 1000,
    admin_switch_dropdown_limit: 2000,

    admin_password_history: 5,

    ws_paging_param: 'page_index',
    ws_lang_param: 'lang_id',
  },
  dynamic: {
    DATA_ENCRYPT_KEY: 'DATA@API!',
    OTP_EXPIRY_SECONDS: 180,
    AUTO_REFRESH_MINUTES: 5,
  },
};
