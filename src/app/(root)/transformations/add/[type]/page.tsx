import Header from "@/components/shared/Header";
import Transformationform from "@/components/shared/Transformationform";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";


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
        <section className="mt-10">
            <Transformationform
                action="Add"
                userId={user._id}
                type = {transformation.type as TransformationTypeKey}
                creditBalance={user.creditBalance}
                />
        </section>       
        </>    
    );
}
 
export default AddTransformationTypePage;