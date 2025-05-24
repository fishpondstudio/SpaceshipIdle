export function TitleComp({ children }: React.PropsWithChildren): React.ReactNode {
   return (
      <div
         style={{
            display: "flex",
            fontSize: "var(--mantine-font-size-sm)",
            margin: "-5px 10px",
            textTransform: "uppercase",
            fontWeight: "bold",
            color: "var(--mantine-color-dark-2)",
         }}
      >
         {children}
      </div>
   );
}
