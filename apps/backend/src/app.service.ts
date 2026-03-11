import type {
  CommonResponseDto,
  DeleteMemberRequestDto,
  GroupInfoDto,
  GroupListRequestDto,
  GroupListResponseDto,
  GroupMembersRequestDto,
  GroupMembersResponseDto,
  LoginResultResponseDto,
  QrcodeResponseDto,
  SetGroupCardRequestDto,
} from './app.dto';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as login from 'qq-login-qrcode';

@Injectable()
export class AppService {
  private readonly appid = 715030901;

  async getQrcode(): Promise<QrcodeResponseDto> {
    const result = await login.generateQrCode(this.appid);
    return {
      qrsig: result.qrsig,
      image: result.image,
    };
  }

  async getResult(qrsig: string): Promise<LoginResultResponseDto> {
    return login.checkLoginStatus(qrsig, this.appid);
  }

  async getGroupList(dto: GroupListRequestDto): Promise<GroupListResponseDto> {
    const { skey, p_skey, uin, p_uin } = dto;
    const bkn = this.getCSRFToken(skey);
    const resp = await this.sendPostRequest('https://qun.qq.com/cgi-bin/qun_mgr/get_group_list', `bkn=${bkn}`, {
      skey,
      p_skey,
      uin,
      p_uin,
    });

    if (resp.data.errcode != 0) {
      return resp.data;
    }

    const group_list: GroupInfoDto[] = [
      ...resp.data.create.map((x) => ({ ...x, role: 'creator', roleName: '群主' } as GroupInfoDto)),
      ...resp.data.manage.map((x) => ({ ...x, role: 'manager', roleName: '管理员' } as GroupInfoDto)),
      ...resp.data.join.map((x) => ({ ...x, role: 'member', roleName: '群员' } as GroupInfoDto)),
    ];

    return {
      errcode: 0,
      list: group_list,
    };
  }

  async getGroupMembers(dto: GroupMembersRequestDto): Promise<GroupMembersResponseDto> {
    const { skey, p_skey, uin, p_uin, gc, st, end } = dto;
    const bkn = this.getCSRFToken(skey);
    const resp = await this.sendPostRequest(
      `https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?bkn=${bkn}&ts=${Date.now()}`,
      `st=${st}&end=${end}&sort=1&gc=${gc}&group_id=${gc}&bkn=${bkn}`,
      { skey, p_skey, uin, p_uin }
    );
    return resp.data;
  }

  async setGroupCard(dto: SetGroupCardRequestDto): Promise<CommonResponseDto> {
    const { skey, p_skey, uin, p_uin, gc, u, name } = dto;
    const bkn = this.getCSRFToken(skey);
    const resp = await this.sendPostRequest(
      `https://qun.qq.com/cgi-bin/qun_mgr/set_group_card?bkn=${bkn}&ts=${Date.now()}`,
      `gc=${gc}&u=${u}&name=${encodeURIComponent(name)}&bkn=${bkn}`,
      { skey, p_skey, uin, p_uin }
    );
    return resp.data;
  }

  async deleteMember(dto: DeleteMemberRequestDto): Promise<CommonResponseDto> {
    const { skey, p_skey, uin, p_uin, gc, ul } = dto;
    const bkn = this.getCSRFToken(skey);
    const resp = await this.sendPostRequest(
      `https://qun.qq.com/cgi-bin/qun_mgr/delete_group_member?bkn=${bkn}&ts=${Date.now()}`,
      `gc=${gc}&ul=${ul}&flag=0&bkn=${bkn}`,
      { skey, p_skey, uin, p_uin }
    );
    return resp.data;
  }

  private async sendPostRequest(
    url: string,
    data: string,
    cookies: { skey: string; p_skey: string; uin: string; p_uin: string }
  ) {
    return axios.post(url, data, {
      headers: {
        'cookie': `uin=${cookies.uin}; skey=${cookies.skey}; p_uin=${cookies.p_uin}; p_skey=${cookies.p_skey};`,
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
  }

  private getCSRFToken(skey: string): number {
    if (skey) {
      let t = 5381;
      for (let r = 0; r < skey.length; ++r) {
        t += (t << 5) + skey.charAt(r).charCodeAt(0);
      }
      return 2147483647 & t;
    }
    return 0;
  }
}
