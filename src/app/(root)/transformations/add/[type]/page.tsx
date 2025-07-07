import Header from "@/components/shared/Header";
import Transformationform from "@/components/shared/Transformationform";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/dist/server/api-utils";

const AddTransformationTypePage = async ({ params : {type} }:SearchParamProps) => {
    const {userId,redirectToSignIn} = await auth();
    const transformation = transformationTypes[type];
    if(!userId) return redirectToSignIn();
    const user = await getUserById(userId);
    return (
        <>
            <Header
            title={transformation.title}
            subtitle={transformation.subTitle}
            />
            <Transformationform
                action="Add"
                userId={user._id}
                type = {transformation.type as TransformationTypeKey}
                creditBalance={user.creditBalance}
                />
        </>    
    );
}
 
export default AddTransformationTypePage;