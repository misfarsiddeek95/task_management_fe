import { HeroUIProvider } from "@heroui/react";

export default function App() {
  return (
    <HeroUIProvider>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </HeroUIProvider>
  );
}
