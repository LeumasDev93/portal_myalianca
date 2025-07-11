/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Card.tsx
import { Product } from "@/types/typesData";
import { IoCalculatorOutline } from "react-icons/io5";

interface CardProps {
  product: Product;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR;

const Card = ({ product }: CardProps) => {
  return (
    <div className="flex flex-col items-center justify-between bg-blue-100 border border-[#002855] rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8 cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="w-full flex justify-between items-start">
        <div>
          <h3 className="text-xs xl:text-lg text-[#002855] font-semibold">
            {product.name}
          </h3>
          <span className="text-[10px] xl:text-sm text-[#002855]">
            {product.description}
          </span>
        </div>
        <IoCalculatorOutline className="text-[#002855] size-4 xl:size-6" />
        {/* <Image
          src={`${baseUrl}/${product.icon}`}
          alt={"Icone"}
          width={40}
          height={40}
        /> */}
      </div>
      <button className="w-full cursor-pointer bg-[#002855] hover:bg-[#002855]/70 py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base transition-colors">
        Simular Agora
      </button>
    </div>
  );
};

export default Card;
