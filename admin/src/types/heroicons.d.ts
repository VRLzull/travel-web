declare module '@heroicons/react/24/outline' {
  import { FC, SVGProps } from 'react';
  
  export const ArrowUpIcon: FC<SVGProps<SVGSVGElement>>;
  export const ArrowDownIcon: FC<SVGProps<SVGSVGElement>>;
  export const CurrencyDollarIcon: FC<SVGProps<SVGSVGElement>>;
  export const UserGroupIcon: FC<SVGProps<SVGSVGElement>>;
  export const ClockIcon: FC<SVGProps<SVGSVGElement>>;
  export const CheckCircleIcon: FC<SVGProps<SVGSVGElement>>;
  
  // Ikon untuk halaman packages
  export const PencilIcon: FC<SVGProps<SVGSVGElement>>;
  export const TrashIcon: FC<SVGProps<SVGSVGElement>>;
  export const PlusIcon: FC<SVGProps<SVGSVGElement>>;
  export const MagnifyingGlassIcon: FC<SVGProps<SVGSVGElement>>;
  
  // Ekspor default untuk kompatibilitas
  const content: {
    [key: string]: FC<SVGProps<SVGSVGElement>>;
  };
  export default content;
}
