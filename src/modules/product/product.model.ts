import mongoose, { Schema, Document, Model, Types } from "mongoose";

/* ===================== TYPES ===================== */

export interface IImage {
  url: string;
  public_id: string;
}

export interface IProduct extends Document {
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  brand?: string;
  stock: number;
  reservedStock: number;
  images: IImage[];
  ratings: number;
  numReviews: number;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ===================== IMAGE SCHEMA ===================== */

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

/* ===================== PRODUCT SCHEMA ===================== */

const productSchema = new Schema<IProduct>(
  {
    /* 🏷 BASIC INFO */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    /* 💰 PRICE */
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 95,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    /* 📦 STOCK */
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: [imageSchema],

    /* ⭐ REVIEWS */
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    tags: {
      type: [String],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===================== VALIDATION HOOK ===================== */

productSchema.pre<IProduct>("save", function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (this.stock < 0) this.stock = 0;
  if (this.reservedStock < 0) this.reservedStock = 0;
});

/* ===================== INDEXES ===================== */

productSchema.index({ name: "text", category: 1, brand: 1 });
productSchema.index({ price: 1 });

/* ===================== MODEL ===================== */

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  productSchema
);

export default Product;
