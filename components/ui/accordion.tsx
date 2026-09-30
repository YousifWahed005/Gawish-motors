import { type ReactNode } from "react";
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="accordion">{children}</div>;
}
export function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details>
      <summary>
        {title}
        <span aria-hidden="true">+</span>
      </summary>
      <div>{children}</div>
    </details>
  );
}
