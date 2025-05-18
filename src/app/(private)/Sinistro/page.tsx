import SinistroCoberturaCard from "@/components/SinistroCoberturaCard";
import SinistroDetailsCard from "@/components/SinistroDetailsCard";

export default function SinistroScreen() {
  return (
    <div className="flex flex-col p-4 space-y-10">
      <section className="flex flex-col  ">
        <SinistroDetailsCard />
      </section>
      <section className="flex flex-col">
        <SinistroCoberturaCard />
      </section>
    </div>
  );
}
