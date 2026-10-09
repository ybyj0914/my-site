import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "看这里～",

	// 公告内容
	content: "你的幸福，由我测度！",

	// 是否允许用户关闭公告
	closable: false,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "参与测试",
		// 链接 URL
		url: "/tests/",
		// 是否为外部链接
		external: false,
	},
};
