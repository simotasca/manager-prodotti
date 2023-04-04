import { BuildingOfficeIcon, DocumentPlusIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { cloneElement } from 'react';
import EditableSvg from './EditableSvg';

export function PageTitle({ children, className = '' }) {
  return <h1 className={className + ' text-3xl font-[Montserrat] uppercase font-bold text-neutral-600'}>{children}</h1>;
}

export function Page({ children, className = '' }) {
  return <div className={className + ' p-4 pt-8 max-w-screen-xl'}>{children}</div>;
}

function SidebarLink({ name, href, IconComponent, active }) {
  return (
    <Link
      className={
        'text-xl font-medium font-[Montserrat] flex gap-5 items-center ' + (!active ? 'opacity-80' : 'opacity-100')
      }
      href={href}>
      {IconComponent && cloneElement(IconComponent, { className: 'h-6 ' + (active ? 'opacity-100' : 'opacity-70') })}
      {name}
    </Link>
  );
}

function Sidebar() {
  const router = useRouter();
  const isLinkActive = link => {
    return router.pathname.startsWith(link.baseRoute);
  };
  const links = [
    { route: '/aziende', baseRoute: '/aziende', name: 'aziende', IconComponent: UsersIcon },
    { route: '/prodotti', baseRoute: '/prodotti', name: 'prodotti', IconComponent: BuildingOfficeIcon },
    { route: '/categorie', baseRoute: '/cateogrie', name: 'categorie prodotti', IconComponent: Squares2X2Icon },
    { route: '/certificati', baseRoute: '/certificati', name: 'bozze certificati', IconComponent: DocumentPlusIcon },
    // {
    //   route: '/certificati_pdf',
    //   baseRoute: '/certificati_pdf',
    //   name: 'pdf certificati',
    //   IconComponent: DocumentTextIcon
    // }
  ];
  return (
    <>
      <div className='grid grid-cols-[1fr_2fr] items-center gap-4 pb-4'>
        <EditableSvg src='/logo.svg' styles={[{ class: 'cls-1', styles: { opacity: 0.7 } }]} />
        <b className='text-xl uppercase leading-5 font-[Montserrat] py-4'>Gestione certificati</b>
      </div>
      <hr className='border-white opacity-30 mx-4' />
      <div className='h-6'></div>
      <div className='flex flex-col gap-2 pl-4'>
        {links.map((link, idx) => (
          <SidebarLink
            key={idx}
            href={link.route}
            name={link.name}
            active={isLinkActive(link)}
            IconComponent={<link.IconComponent />}
          />
        ))}
      </div>
    </>
  );
}

export default function Layout({ children }) {
  return (
    <div className='grid' style={{ gridTemplateColumns: '300px 1fr' }}>
      <div className='bg-blue-600 p-4 text-neutral-200 h-screen sticky top-0'>
        <Sidebar />
      </div>
      <div>{children}</div>
    </div>
  );
}
