import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    };
  });
  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } if (a > b) {
      return -1;
    } 
    return 0;
    
  });
}

/*
    // Could also use the getSortedPostsData function to call an API with the NextJS built-in fetch functionality:
    export async function getSortedPostsData() {
    // Instead of the file system,
    // fetch post data from an external API endpoint
    const res = await fetch('..')
    return res.json()
    }
*/

/*
    // Or query the database directly:
    import someDatabaseSDK from 'someDatabaseSDK'

    const databaseClient = someDatabaseSDK.createClient(...)

    export async function getSortedPostsData() {
        // Instead of the file system,
        // fetch post data from a database
        return databaseClient.query('SELECT posts...')
    }
*/

/*
    // Or try the NextJS data-hook called SWR for client-side data fetching:
    import useSWR from 'swr'

    function Profile() {
        const { data, error } = useSWR('/api/user', fetch)

        if (error) return <div>failed to load</div>
        if (!data) return <div>loading...</div>
        return <div>hello {data.name}!</div>
    }
*/

/* 
    // To use Server-side Rendering, you need to export getServerSideProps instead of getStaticProps from your page:
    export async function getServerSideProps(context) {
    return {
        props: {
        // props for your component
        }
    }
    }
*/

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  
  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => ({
    params: {
      id: fileName.replace(/\.md$/, '')
    }
  }));
  /* 
        // Instead of fetching from the file system, we can fetch post data from an external API endpoint:
        const res = await fetch('..')
        const posts = await res.json()
        return posts.map(post => {
            return {
                params: {
                    id: post.id
                }
            }
        })
  */
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);
  
  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  
  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  };
}