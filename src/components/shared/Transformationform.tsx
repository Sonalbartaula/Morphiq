"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants"
import CustomField from "./CustomField"
import { startTransition, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/router"

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  publicId: z.string(),
  prompt: z.string().optional(),
})

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type]
  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [ispending,starttransition]=useTransition()
  const router = useRouter()

  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if(data || image){
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig

      })
      const imageData = {
        title:values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secureURL: image?.secureUrl,
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,

      }
      if(action === "Add"){
        try{
          const newImage = await addImage({
            image: imageData,
            userId,
            path: "/"

          })

          if (newImage){
            form.reset()
            setImage(data)
            router.push("/transformations/${newImage._id}")
          }

        }catch (error){
          console.log(error);
        }
      }

      if (action === "Update"){
        try{
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id
            },
            userId,
            path: "/transformations/${data._id}"

          })

          if (updatedImage){
            router.push("/transformations/${updatedImage._id}")
          }

        }catch (error){
          console.log(error);
        }
      }
    }
    setIsSubmitting(false)
  }

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize= aspectRatioOptions[value as AspectRatioKey]
    setImage((prevState: any) => ({
      ...prevState,
      aspectration: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height
  }))
  setNewTransformation(transformationType.config);
  onChangeField(value)
  }

  // RETURN TO IT LATER
  const onInputChangeHandler=(fieldName:string,value:string,
    type:string, onChangeField: (value:string) => void) =>
    {
      debounce(() => {
        setNewTransformation((prevState: any) => ({
          ...prevState,
          [type]:{
            ...prevState?.[type],
            [fieldName === "prompt" ? "prompt" : "to"]:value
          }
        }))
        return onChangeField(value)
      },1000);
    }
    const onTransformHandler = async () => {
      setIsTransforming(true)
      setTransformationConfig(
        deepMergeObjects(newTransformation,transformationConfig)
      )
      setNewTransformation(null)
      startTransition(async () => {
        await updateCredits(userId, -1)
      })
    }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <input {...field} className="input-field" />}
        />

        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectFieldHandler(value, field.onChange)
                }
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="select-item"
                    >
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove"
                  ? "Object to remove"
                  : "Object to recolor"
              }
              className="w-full"
              render={({ field }) => (
                <input {...field.value} 
                className="input-field" 
                onChange={(e) => onInputChangeHandler
                  ("prompt",
                  e.target.value,
                  type,
                  field.onChange
                  )}
                  />
              )}
            />
            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement color"
                className="w-full"
                render={({ field }) => (
                  <input
                    {...field.value} 
                    className="input-field" 
                    onChange={(e) => onInputChangeHandler
                      ("color",
                      e.target.value,
                      "recolor",
                      field.onChange
                      )}
                  
                   />
                )}
              />
            )}

          </div>
        )}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            //come to this later
            // formLabel="Image URL or Public ID"
            render={({field}) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
                
              />

            )}
          />
            <TransformedImage
              image={image}
              type={type}
              title={form.getValues().title}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              transformationConfig={transformationConfig}
            
            
            />
        </div>
        <div className="flex flex-col gap-4">
          <Button 
          type="button"
          className="submit-button capitalize"
          disabled={isTransforming || newTransformation === null }
          onClick={onTransformHandler}
        >{isTransforming? "Transforming..." : 
        "Apply Transformation"}</Button>

        <Button 
          type="submit"
          className="submit-button capitalize"
          disabled={isSubmitting}
        >{isSubmitting? "Submitting..." : "Save Image"}</Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm
