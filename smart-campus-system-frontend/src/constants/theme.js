export const COLORS = {
  primary: '#0F6E56',
  primaryHover: '#085041',
  primaryLight: '#E1F5EE',
  primaryMid: '#1D9E75',
  pendingBg: '#FAEEDA',
  pendingText: '#854F0B',
  pendingBorder: '#EF9F27',
  approvedBg: '#EAF3DE',
  approvedText: '#3B6D11',
  approvedBorder: '#639922',
  rejectedBg: '#FCEBEB',
  rejectedText: '#A32D2D',
  rejectedBorder: '#E24B4A',
  infoBg: '#E6F1FB',
  infoText: '#185FA5',
  infoBorder: '#378ADD',
  purpleBg: '#EEEDFE',
  purpleText: '#534AB7',
};

export const STATUS_BADGE = {
  APPROVED: 'bg-[#EAF3DE] text-[#3B6D11] border border-[#639922]',
  PENDING: 'bg-[#FAEEDA] text-[#854F0B] border border-[#EF9F27]',
  REJECTED: 'bg-[#FCEBEB] text-[#A32D2D] border border-[#E24B4A]',
  ACTIVE: 'bg-[#EAF3DE] text-[#3B6D11] border border-[#639922]',
  INACTIVE: 'bg-[#FCEBEB] text-[#A32D2D] border border-[#E24B4A]',
  STUDENT: 'bg-[#E6F1FB] text-[#185FA5] border border-[#378ADD]',
  LECTURER: 'bg-[#EEEDFE] text-[#534AB7] border border-[#7F77DD]',
  TECHNICIAN: 'bg-[#FAEEDA] text-[#854F0B] border border-[#EF9F27]',
  ADMIN: 'bg-[#FCEBEB] text-[#A32D2D] border border-[#E24B4A]',
  USER: 'bg-gray-100 text-gray-600 border border-gray-300',
};

export const INPUT_CLASS =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent placeholder-gray-400 transition';

export const PRIMARY_BTN =
  'w-full bg-[#0F6E56] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#085041] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed';

export const SECONDARY_BTN =
  'border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition';

export const CARD_CLASS = 'bg-white border border-gray-100 rounded-2xl overflow-hidden';

export const NAV_ACTIVE =
  'flex items-center gap-2 px-3 py-2 text-sm rounded-xl mx-2 bg-white border border-gray-200 text-gray-900 font-medium';

export const NAV_INACTIVE =
  'flex items-center gap-2 px-3 py-2 text-sm rounded-xl mx-2 text-gray-500 hover:text-gray-700 hover:bg-white transition cursor-pointer';
