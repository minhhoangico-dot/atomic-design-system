import type { Meta, StoryObj } from '@storybook/react';
import { __NAME__ } from './__NAME__';

const meta = {
  title: '__TITLE__',
  component: __NAME__,
  tags: ['autodocs', 'alpha'],
  args: { children: 'Nội dung mẫu' },
} satisfies Meta<typeof __NAME__>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Emphasis: Story = { args: { variant: 'emphasis' } };

/** Stress test: long Vietnamese text with stacked diacritics must wrap, not clip. */
export const LongContent: Story = {
  args: {
    children:
      'Nguyễn Thị Ánh Tuyết — Phòng khám Bác sĩ Gia đình, tầng 3, số 75 Hồ Mễ Trì, quận Nam Từ Liêm, Hà Nội. ẪỄỖẲỰẬ',
  },
};
