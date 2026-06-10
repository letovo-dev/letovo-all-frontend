export interface DepartmentMeta {
  color: string;
  borderColor: string;
  iconColor: string;
  name: string;
  icon: string;
}

export const departments: { [key: string]: DepartmentMeta } = {
  '1': {
    color: 'var(--it-header)',
    borderColor: 'var(--it-border)',
    iconColor: 'var(--it-icon)',
    name: 'IT',
    icon: '/26_it.svg',
  },
  '2': {
    color: 'var(--management-header)',
    borderColor: 'var(--management-border)',
    iconColor: 'var(--management-icon)',
    name: 'Менеджмент',
    icon: '/26_management.svg',
  },
  '3': {
    color: 'var(--enginery-header)',
    borderColor: 'var(--enginery-border)',
    iconColor: 'var(--enginery-icon)',
    name: 'Инженерный',
    icon: '/26_engineer.svg',
  },
  '4': {
    color: 'var(--public-relations-header)',
    borderColor: 'var(--public-relations-border)',
    iconColor: 'var(--public-relations-icon)',
    name: 'Связи с общественностью',
    icon: '/26_x.svg',
  },
  '5': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Арт',
    icon: '/26_design.svg',
  },
  '6': {
    color: 'var(--science-header)',
    borderColor: 'var(--science-border)',
    iconColor: 'var(--science-icon)',
    name: 'Наука',
    icon: '/26_science.svg',
  },
  '7': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Проект 11',
    icon: '/26_proj11.svg',
  },
  '8': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Клуб',
    icon: '/26_proj11.svg',
  },
  '10': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Дизайн',
    icon: '/26_design.svg',
  },
  '11': {
    color: 'var(--x-header)',
    borderColor: 'var(--x-border)',
    iconColor: 'var(--x-icon)',
    name: 'Х',
    icon: '/26_x.svg',
  },
};
