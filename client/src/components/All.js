import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./Home.css";
import Cookies from 'js-cookie';
import moment from 'moment';
import First from "./First";

const All = () => {
  const usernameFromCookie = Cookies.get('username');

  const [posts, setPosts] = useState([]);
  const [likesData, setLikesData] = useState({});
  const Author = usernameFromCookie;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("https://wrightist-backend.vercel.app/api/allpost");
      const data = await response.json();

      
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedData);

     
      sortedData.forEach(post => {
        fetchLikes(post.pid);
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchLikes = async (postid) => {
    try {
      const response = await fetch(`https://wrightist-backend.vercel.app/api/GetLikes/${postid}`);
      const data = await response.json();
      setLikesData(prevLikesData => ({
        ...prevLikesData,
        [postid]: data
      }));
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLikes = async (e, pid) => {
    e.preventDefault();
    try {
      const response = await fetch("https://wrightist-backend.vercel.app/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ postid: pid, author: Author })
      });

      if (response.ok) {
        console.log("Post liked successfully!");
       
        fetchLikes(pid);
      } else {
        const result = await response.json();
        console.error("Failed to like:", result.error);
      }
    } catch (error) {
      console.error("Error in liking:", error);
    }
  };

  return (
    <Container className="main">
      <h1><First/> here </h1>
      <Row>
        <Col>
          <ul className="postcard">
            {posts.map(({ pid, postTitle, author, postContent, createdAt }) => (
              <li key={pid} className="li">
                <Card style={{ width: "58rem" }} className="card">
                  <Card.Body className="post">
                    <Card.Title><h3>{postTitle}</h3></Card.Title>
                    <Card.Subtitle>Author: {author}</Card.Subtitle>
                    <br/>
                    <Card.Subtitle className="mb-2 text-muted">
                      Posted on: {moment(createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                    </Card.Subtitle>
                    <hr />
                    <Card.Text>{postContent}</Card.Text>
                    <hr />
                    <div>
                      <strong>{likesData[pid]?.NbrLikes || 0} Likes</strong> |
                      <button
                        className="like-button"
                        onClick={(e) => handleLikes(e, pid)}
                        disabled={likesData[pid]?.alllikes?.some(like => like.author === usernameFromCookie)}
                      >
                        {likesData[pid]?.alllikes?.some(like => like.author === usernameFromCookie) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default All;
