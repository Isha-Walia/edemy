import { Course } from "../models/course.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required",
      });
    }
    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });
    return res.status(201).json({
      course,
      message: "Course created",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "failed to create course ",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      res.status(404).json({
        courses: [],
        message: "course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "failed to get your courses ",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById({courseId});
    if(!course){
        return res.status(404).json({
            message:"course not found"
        })
    }
    let courseThumbnail
    if(thumbnail){
        if(course.courseThumbnail){
            const publicId= course.courseThumbnail.split("/").pop().split(".")[0]
            // console.log(course.courseThumbnail.split("/"))
            // console.log(course.courseThumbnail.split("/").pop())
            await deleteMediaFromCloudinary(publicId)
            //delete old image 
 }
 //upload new thumbnail 
 courseThumbnail= await uploadMedia(thumbnail.path)
    }


    const updateData= {
        courseTitle,
        subTitle,
        description,
        category,
        courseLevel,
        coursePrice,
        courseThumbnail: courseThumbnail.secure_url
      }

      course= await Course.findByIdAndUpdate(courseId, updateData, {new:true})
      return res.status(200).json({
        course, message:"course updated successfully"
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "failed to get your courses ",
    });
  }
};
