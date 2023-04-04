import { Button } from ".";

export function LoadingButton({ children, loading = false, className, ...props }) {
  return (
    <Button className={'stacked items-center justify-center ' + className} {...props}>
      <span className={loading ? 'invisible' : ''}>{children}</span>
      {loading && <div className='mx-auto animate-spin border-2 border-t-0 rounded-full aspect-square w-4'></div>}
    </Button>
  );
}
