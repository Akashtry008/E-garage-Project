import React from 'react'
import { useForm } from "react-hook-form";

export const AddService = () => {

    const { register, handleSubmit } = useForm()

    const submitHandler = (data) => {
        console.log(data)
    }

    return (
        <>
            <div className="max-w-xl mx-auto mt-10 p-5">

                <h2>Add New Service</h2>

                <div>
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                        <div>
                            <label for="serviceImage">Upload Service Image</label>
                            <input type="file" id="serviceImage" name="image" {...register("image")} />
                        </div>
                        <div>
                            <label for="serviceName">Service Name</label>
                            <input id="serviceName" name="serviceName" {...register("serviceName")} />
                        </div>
                        <div>
                            <label for="serviceDescription">Description</label>
                            <textarea id="serviceDescription" name="serviceDescription" {...register("serviceDescription")} />
                        </div>
                        <div>
                            <label for="price">Price ($)</label>
                            <input id="price" type="number" name="price" {...register("price")} />
                        </div>
                        <div>
                            <label for="duration">Estimated Duration (minutes)</label>
                            <input id="duration" type="number" name="duration" {...register("duration")} />
                        </div>
                        <button type="submit" className="w-full">Add Service</button>
                    </form>
                </div>
            </div>
        </>
    );
}