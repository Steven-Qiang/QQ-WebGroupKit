import type { LoginResult, QQLoginCookies, QrCodeResult } from 'qq-login-qrcode';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/** 基础认证信息 */
export class BaseAuthDto {
  /** skey */
  @IsString()
  skey: string;

  /** p_skey */
  @IsString()
  p_skey: string;

  /** uin */
  @IsString()
  uin: string;

  /** p_uin */
  @IsString()
  p_uin: string;
}

/** 群列表请求 */
export class GroupListRequestDto extends BaseAuthDto {}

/** 群信息 */
export class GroupInfoDto {
  /** 群号 */
  gc: number;

  /** 群名称 */
  gn: string;

  @ApiProperty({ description: '角色', enum: ['creator', 'manager', 'member'] })
  role: string;

  /** 角色名称: 群主/管理员/群员 */
  roleName: string;
}

/** 群列表响应 */
export class GroupListResponseDto {
  /** 错误码 */
  errcode: number;

  /** 群列表 */
  list: GroupInfoDto[];
}

/** 群成员分页参数 */
class GroupMembersPaginationDto {
  /** 群号 */
  @IsNumber()
  gc: number;

  /** 起始位置 */
  @IsNumber()
  st: number;

  /** 结束位置 */
  @IsNumber()
  end: number;
}

/** 群成员列表请求 */
export class GroupMembersRequestDto extends IntersectionType(BaseAuthDto, GroupMembersPaginationDto) {}

/** 群成员等级信息 */
export class MemberLevelDto {
  /** 积分 */
  point: number;

  /** 等级 */
  level: number;
}

export enum MemberRole {
  lord = 0,
  manage = 1,
  member = 2,
}

/** 群成员信息 */
export class GroupMemberDto {
  /** QQ号 */
  uin: number;

  @ApiProperty({
    description: '角色:0=群主,1=管理员,2=成员',
    enum: MemberRole,
  })
  role: MemberRole;

  /** 性别: 0=男, 1=女, 其他未知 */
  g: number;

  /** 加群时间 */
  join_time: number;

  /** 最后发言时间 */
  last_speak_time: number;

  /** 等级信息 */
  lv: MemberLevelDto;

  /** 群名片 */
  card: string;

  /** 标签 */
  tags: string;

  /** 标志 */
  flag: number;

  /** 昵称 */
  nick: string;

  /** Q龄 */
  qage: number;

  /** 是否有权限踢出 */
  rm: number;
}

/** 群成员列表响应 */
export class GroupMembersResponseDto {
  /** 错误码 */
  ec: number;

  /** 错误码 */
  errcode: number;

  /** 错误信息 */
  em: string;

  /** 管理员数量 */
  adm_num: number;

  /** 等级名称映射 */
  levelname: Record<string, string>;

  /** 成员列表 */
  mems: GroupMemberDto[];

  /** 总数 */
  count: number;

  /** 服务器时间 */
  svr_time: number;

  /** 最大人数 */
  max_count: number;

  /** 搜索结果数 */
  search_count: number;
}

/** 群操作基础参数 */
class GroupOperationDto {
  /** 群号 */
  @IsNumber()
  gc: number;
}

/** 修改群名片参数 */
class SetCardDto {
  /** 目标用户QQ号 */
  @IsNumber()
  u: number;

  /** 新名片 */
  @IsString()
  name: string;
}

/** 修改群名片请求 */
export class SetGroupCardRequestDto extends IntersectionType(BaseAuthDto, GroupOperationDto, SetCardDto) {}

/** 删除成员参数 */
class DeleteMemberDto {
  /** 目标用户QQ号 */
  @IsNumber()
  ul: number;
}

/** 删除群成员请求 */
export class DeleteMemberRequestDto extends IntersectionType(BaseAuthDto, GroupOperationDto, DeleteMemberDto) {}

/** 通用响应 */
export class CommonResponseDto {
  /** 错误码 */
  ec: number;

  /** 错误信息 */
  em?: string;
}

export class QrcodeResponseDto implements Omit<QrCodeResult, 'buffer'> {
  qrsig: string;
  image: string;
}

export class LoginGetResultReqDto {
  @IsNotEmpty()
  qrsig: string;
}

class IQQLoginCookies implements QQLoginCookies {
  [key: string]: string | undefined;
  pt2gguin?: string;
  uin?: string;
  skey?: string;
  superuin?: string;
  supertoken?: string;
  superkey?: string;
  pt_recent_uins?: string;
  RK?: string;
  ptnick_?: string;
  ptcz?: string;
  p_uin?: string;
  pt4_token?: string;
  p_skey?: string;
}

export class LoginResultResponseDto implements LoginResult {
  code: number;
  msg: string;
  uin?: string;
  cookies?: IQQLoginCookies;
}
