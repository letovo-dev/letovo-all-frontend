export interface AdminRoleRights {
  write_posts: boolean;
  admin: boolean;
  moder: boolean;
  main_page: boolean;
  whireable: boolean;
  ava_upload: boolean;
}

export interface AdminCreateUserPayload {
  username: string;
  display_name: string;
  password: string;
  chattable: boolean;
  userrights: 'user' | 'child' | 'author' | 'moder' | 'public_author' | 'admin';
  role_id: number;
  active: boolean;
  registered: boolean;
  role_rights: AdminRoleRights;
}

export interface DepartmentOption {
  departmentid: number | string;
  departmentname: string;
}

export interface DepartmentRoleOption {
  roleid: string;
  rolename: string;
  rang: string;
  departmentid: string;
  payment: string;
}
