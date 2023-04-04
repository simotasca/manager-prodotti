import { BoltIcon } from '@heroicons/react/24/solid';

function NotFound() {
  return (
    <div className='stacked place-items-center h-full'>
      <h1 className='text-6xl text-center font-bold font-[Montserrat] z-10 text-neutral-700 '>Page not found</h1>
      <BoltIcon className='text-blue-600 opacity-20 h-[50vh] max-w-[80vw]' />
    </div>
  );
}

export default NotFound;
