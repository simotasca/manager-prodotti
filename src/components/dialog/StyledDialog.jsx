import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';

function StyledDialog({ children, title = 'Dialog', isOpen, onClose }) {
  return (
    <Dialog as='div' className='relative z-50' open={isOpen} onClose={onClose}>
      <div className='fixed inset-0 bg-black bg-opacity-25' />
      <div className='fixed inset-0 overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4 text-center'>
          <Dialog.Panel className='relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
            <XMarkIcon className='absolute right-2 top-2 w-6 text-neutral-400 cursor-pointer' onClick={onClose} />
            <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
              {title}
            </Dialog.Title>
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

export default StyledDialog;
