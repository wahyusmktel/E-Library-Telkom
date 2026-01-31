import Skeleton, { SkeletonProps } from 'react-loading-skeleton';
import { cn } from '@/lib/utils';

interface CustomSkeletonProps extends SkeletonProps {
    className?: string;
}

export const SkeletonWrapper = ({ className, ...props }: CustomSkeletonProps) => {
    return (
        <div className={cn("w-full", className)}>
            <Skeleton {...props} />
        </div>
    );
};

export default SkeletonWrapper;
