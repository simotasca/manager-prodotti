import Link from "next/link";
import { Button } from ".";

export function LinkButton({ children, href, className = '', color = 'green' }) {
  return (
    <Link href={href} className={className}>
      <Button color={color}>{children}</Button>
    </Link>
  );
}
