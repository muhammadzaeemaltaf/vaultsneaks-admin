"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Trash, Star, RefreshCw } from "lucide-react"
import { getAllReviews } from "@/sanity/reviews/getProductReviews"
import { urlFor } from "@/sanity/lib/image"
import { Review } from "../../../../sanity.types"
import { client } from "@/sanity/lib/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const reviewsData = await getAllReviews()
    setReviews(reviewsData)
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(
    (review) =>
      (review.reviewerName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.productId ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.reviewId ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openDialog = (images: string[]) => {
    setSelectedReviewImages(images)
    setIsDialogOpen(true)
  }

  const deleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId)
    try {
      await client.delete(reviewId)
      setReviews(reviews.filter((review) => review._id !== reviewId))
    } catch (error) {
      console.error("Error deleting review:", error)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text
    }
    const regex = new RegExp(`(${highlight})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={fetchReviews}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Table className="text-theme">
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No reviews found</TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  {deletingReviewId === review._id ? (
                    <TableCell colSpan={7} className="animate-pulse bg-gray-200 h-10"></TableCell>
                  ) : (
                    <>
                      <TableCell className="font-medium">{highlightText(review.reviewerName ?? "", searchTerm)}</TableCell>
                      <TableCell>{highlightText(review.productId ?? "", searchTerm)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < (review.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{highlightText(review.reviewText ?? "", searchTerm)}</TableCell>
                      <TableCell>{review.reviewDate ? format(new Date(review.reviewDate), "MMM d, yyyy") : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {review.reviewPicture?.slice(0, 3).map((pic, index) => (
                            <div key={index} className="relative w-10 h-10">
                              <Image
                                src={urlFor(pic).url() || "/placeholder.svg"}
                                alt={`Review image ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded"
                              />
                              {index === 2 && (review.reviewPicture?.length ?? 0) > 3 && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-bold cursor-pointer rounded"
                                  onClick={() =>
                                    review.reviewPicture &&
                                    openDialog(review.reviewPicture.map((pic) => urlFor(pic).url() || "/placeholder.svg"))
                                  }
                                >
                                  +{(review.reviewPicture?.length ?? 0) - 3}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteReview(review._id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Review Images</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {selectedReviewImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Review image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

