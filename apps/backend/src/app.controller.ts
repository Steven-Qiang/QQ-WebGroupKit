import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CommonResponseDto,
  DeleteMemberRequestDto,
  GroupListRequestDto,
  GroupListResponseDto,
  GroupMembersRequestDto,
  GroupMembersResponseDto,
  LoginGetResultReqDto,
  LoginResultResponseDto,
  QrcodeResponseDto,
  SetGroupCardRequestDto,
} from './app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('get-qrcode')
  @ApiOperation({ summary: '获取登录二维码' })
  async getQrcode(): Promise<QrcodeResponseDto> {
    return this.appService.getQrcode();
  }

  @Post('get-result')
  @ApiOperation({ summary: '获取登录结果' })
  async getResult(@Body(){ qrsig }: LoginGetResultReqDto): Promise<LoginResultResponseDto> {
    return this.appService.getResult(qrsig);
  }

  @Post('group-list')
  @ApiOperation({ summary: '获取群列表' })
  async getGroupList(@Body() dto: GroupListRequestDto): Promise<GroupListResponseDto> {
    return this.appService.getGroupList(dto);
  }

  @Post('group-members')
  @ApiOperation({ summary: '获取群成员列表' })
  async getGroupMembers(@Body() dto: GroupMembersRequestDto): Promise<GroupMembersResponseDto> {
    return this.appService.getGroupMembers(dto);
  }

  @Post('set-group-card')
  @ApiOperation({ summary: '修改群名片' })
  async setGroupCard(@Body() dto: SetGroupCardRequestDto): Promise<CommonResponseDto> {
    return this.appService.setGroupCard(dto);
  }

  @Post('delete-member')
  @ApiOperation({ summary: '删除群成员' })
  async deleteMember(@Body() dto: DeleteMemberRequestDto): Promise<CommonResponseDto> {
    return this.appService.deleteMember(dto);
  }
}
