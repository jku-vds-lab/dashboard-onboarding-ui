import {Position} from "reactflow";

const SimpleNode = ({data}) => {
    return (
        <div className={`node simple-node ${data.type}`}>
            <div className={`header`}>
                <p className="title">{data?.title ?? "Untitled"}</p>
            </div>
        </div>
    );
};

export default SimpleNode;
