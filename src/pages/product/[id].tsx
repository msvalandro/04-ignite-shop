import { GetStaticProps } from 'next'
import Image from 'next/image'
import { Stripe } from 'stripe'

import { stripe } from '@/src/lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/src/styles/pages/product'

interface ProductProps {
  product: {
    id: string
    name: string
    price: string
    imageUrl: string
    description: string
  }
}

export default function Product({ product }: ProductProps) {
  return (
    <ProductContainer>
      <ImageContainer>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={520}
          height={480}
        />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>

        <p>{product.description}</p>

        <button>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  )
}

export const getStaticPaths = async () => {}

export const getStaticProps: GetStaticProps<
  ProductProps,
  { id: string }
> = async ({ params }) => {
  const { id } = params!

  const product = await stripe.products.retrieve(id, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price.unit_amount ? price.unit_amount / 100 : 999)

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        price: formattedPrice,
        imageUrl: product.images[0],
        description: product.description || '',
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}
