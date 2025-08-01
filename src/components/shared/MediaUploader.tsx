"use client";

import { dataUrl, getImageSize } from "@/lib/utils"
import {CldImage, CldUploadWidget} from "next-cloudinary"
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props"
import Image from "next/image"
import { toast } from "sonner"

type MediaUploaderProps={
    onValueChange: (value:string) => void
    setImage: React.Dispatch<any>;
    publicId: string;
    type: string;
    image: any;
}

const MediaUploader = ({
    onValueChange,
    setImage,
    image,
    publicId,
    type,
}: MediaUploaderProps) => {
 
    const onUploadSuccessHandler=(result:any) => {   
         setImage((prevState: any) => ({
            ...prevState,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureUrl: result?.info?.secure_url,
         }));
        onValueChange(result?.info?.public_id);
        


        toast.success("Image uploaded successfully", {
      className: "success-toast",
      description: "1 credit was deducted from your account",
      position: "top-right",
    });
    }
    const onUploadErrorHandler=() => {
      toast.error("Something went wrong while uploading", {
      className: "error-toast",
      description: "Please ty again",
      duration:5000,
      position: "top-right",
      
    });
    }
  return (
    <CldUploadWidget
        uploadPreset="Morphiq"   
        options={{
            multiple: false,
            resourceType: "image",

        }} 
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}
   
    >
        {({open}) => (
            <div className="flex flex-col gap-4">
                <h3 className="h3-bold text-dark-600">
                    Original
                </h3>

                {publicId ? (
                    <div className="cursor-pointer 
                    overflow-hidden rounded-[10px">
                        <CldImage
                            width={getImageSize(type, image , "width")}
                            height={getImageSize(type, image, "height")}
                            src={publicId}
                            alt="image"
                            sizes={"(max-width: 767px)100vw, 50v"}
                            placeholder={dataUrl as PlaceholderValue}
                            className="media-uploader_CldImage"
                            />

                    </div>
                    
                ):(
                    <div className="media-uploader_cta" onClick={() => open()}>
                        <div className="media-uploader_cta-image">
                            <Image
                                src="/assets/icons/add.svg"
                                alt="Add Image"
                                width={24}
                                height={24}
                            />
                            
                            </div> 
                       <p className="p-14-medium">Click here to 
                        upload image</p>
                    </div>
                )}

            </div>
        )}
    </CldUploadWidget>    
  )
}

export default MediaUploader