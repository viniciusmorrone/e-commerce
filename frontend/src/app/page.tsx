import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ColecaoSection } from "@/components/home/colecao-section";
import { Newsletter } from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <ColecaoSection titulo="CAMISETAS" categoriaSlug="camisetas" verMaisHref="/produtos?categoria=camisetas" />
      <ColecaoSection titulo="CALÇAS" categoriaSlug="calcas" verMaisHref="/produtos?categoria=calcas" />
      <ColecaoSection titulo="CHINELOS" categoriaSlug="chinelos" verMaisHref="/produtos?categoria=chinelos" />
      <ColecaoSection titulo="BONÉS" categoriaSlug="bones" verMaisHref="/produtos?categoria=bones" />
      <ColecaoSection titulo="ACESSÓRIOS" categoriaSlug="acessorios" verMaisHref="/produtos?categoria=acessorios" />
      <Newsletter />
    </>
  );
}
