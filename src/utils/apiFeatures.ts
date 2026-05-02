import { Query } from "mongoose";

/**
 * 🔍 Query string type (Express req.query safe shape)
 */
interface QueryString {
  [key: string]: unknown;
  keyword?: string;
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
}

/**
 * 📦 API Features Class
 */
class APIFeatures<T> {
  public query: Query<any, any>;
  public queryString: QueryString;
  public pagination?: {
    page: number;
    limit: number;
  };

  constructor(query: Query<any, any>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * 🔍 Search (TEXT INDEX BASED)
   */
  search(): this {
    if (this.queryString.keyword) {
      this.query = this.query.find({
        $text: { $search: this.queryString.keyword },
      });
    }
    return this;
  }

  /**
   * 🎯 Filter (SAFE)
   */
  filter(): this {
    const queryObj: QueryString = { ...this.queryString };

    const excludedFields = ["keyword", "page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt|in)\b/g,
      (key) => `$${key}`
    );

    const parsed = JSON.parse(queryStr);

    // 🔒 Force active products only
    parsed.isActive = true;

    this.query = this.query.find(parsed);

    return this;
  }

  /**
   * ↕️ Sorting
   */
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  /**
   * 📄 Pagination (SAFE LIMIT)
   */
  paginate(): this {
    const page = Math.max(Number(this.queryString.page) || 1, 1);
    const limit = Math.min(Number(this.queryString.limit) || 10, 50);

    const skip = (page - 1) * limit;

    this.query = this.query.limit(limit).skip(skip);

    this.pagination = { page, limit };

    return this;
  }

  /**
   * 📦 Field Limiting
   */
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  /**
   * ⚡ Performance Boost
   */
  lean(): this {
    this.query = this.query.lean();
    return this;
  }
}

export default APIFeatures;