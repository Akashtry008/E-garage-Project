import React from 'react'
import './ProductCreate.css'

export const ProductCreate = () => {
    return (
        <>
            <body>
                <div className='sc'>
                    <div className="fc">
                        {/* Product Name */}
                        <h2 className='h2'>Add New Product</h2>
                        <div className="fg">
                            <label>Name</label>
                            <input type='text' label="Product Name" source="name" placeholder='Enter Product Name' /* validate={required()}*/ className="if" />
                        </div>

                        {/* Description */}
                        <div className="fg">
                            <label>Description</label>
                            <input type='text' label="Description" source="description" placeholder='Add Description' /* validate={required()}*/ className="if" />
                        </div>

                        {/* Price */}
                        <div className="fg">
                            <label>Price</label>
                            <input type='number' label="Price" source="price" placeholder='Enter Price' /* validate={required()}*/ /* min={0} */ className="if" />
                        </div>

                        {/* Category */}
                        <div className="fg">
                            <label>Category</label>
                            <select className="if" >
                                <option></option>
                                <option value="Tires"> Tires</option>
                                <option value="Oil">Oil</option>
                                <option value="Battery">Battery</option>
                                <option value="Parts">Parts</option>
                            </select>
                        </div>

                        {/* Stock Quantity */}
                        <div className="fg">
                            <label>Stock</label>
                            <input type='number' label="Stock Quantity" placeholder='Add Quantity' source="stock" /* validate={required()} min={0} */ className="if" />
                        </div>

                        {/* Product Image Upload */}
                        <div className="fg">
                            <input type="file" label="Upload Image" source="image" accept="image/*">
                                {/* <FileField source="src" title="title" /> */}
                            </input>
                        </div>

                        {/* Save Button */}
                        <div className="fg">
                            <input type='submit' name='savebutton' className="save-button" />
                        </div>
                    </div>
                    {/* </SimpleForm> */}
                </div>
            </body>
        </>
    )
}
