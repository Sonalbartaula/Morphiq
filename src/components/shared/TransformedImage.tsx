import { dataUrl, debounce, getImageSize } from '@/lib/utils'
import { CldImage } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React from 'react'

const TransformedImage = ({image, type, title, transformationConfig,
    isTransforming, setIsTransforming, hasDownload= false}: TransformedImageProps
) => {
    const downloadHandler=() => {}
  return (
    <div className="flex flex-col gap-4">
        <div className="flex-between">
            <h3 className="h3-bold text-dark-600">
                Transformed
            </h3>
            {hasDownload && (
                <button 
                    className="download-btn" 
                    onClick={downloadHandler} >
                    <Image 
                        src="/assets/icons/download.svg"
                        alt="download"
                        width={24}
                        height={24}
                        className="pb-[6px]" />         
                    </button>
            )}
        </div>
        {image?.publicId && transformationConfig ? (
            <div className="relative">
                 <CldImage
                            width={getImageSize(type, image , "width")}
                            height={getImageSize(type, image, "height")}
                            src={image?.publicId}
                            alt={image?.title}
                            sizes={"(max-width: 767px)100vw, 50v"}
                            placeholder={dataUrl as PlaceholderValue}
                            className="transfomed-image"
                            onLoad={() => {
                                setIsTransforming && setIsTransforming
                                (false);
                            }}
                            onError={() => {
                                debounce(() => {
                                    setIsTransforming && setIsTransforming
                                    (false);
                                }, 8000)
                            }}
                            {...transformationConfig}
                            />
                            (isTransforming && (
                                <div className="transforming-loader">
                                <Image 
                                  src="/assets/icons/spinner.svg"
                                  width={50}
                                  height={50}
                                  alt="Transforming"
                                  />
                                </div>
                            ))
            </div>
        ):(
            <div className="transformed-placeholder">
                Transformed Image 
            </div>
        )}
    </div>
  )
}

export default TransformedImage